from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
from pathlib import Path
import os
import logging
import uuid

from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin
)
from email_service import send_order_confirmation, send_review_notification
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe setup
STRIPE_API_KEY = os.getenv('STRIPE_API_KEY', 'sk_test_emergent')

# Create the main app
app = FastAPI(title="Luxury E-commerce API")
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_admin: bool = False

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

# Product Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    images: List[str] = []
    in_stock: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    images: List[str] = []
    in_stock: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    in_stock: Optional[bool] = None

# Banner Models
class Banner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    image_url: str
    product_id: Optional[str] = None
    order: int = 0
    active: bool = True

class BannerCreate(BaseModel):
    title: str
    description: str
    price: float
    image_url: str
    product_id: Optional[str] = None
    order: int = 0

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    product_id: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    product: Product
    quantity: int

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total: float

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    items: List[OrderItem]
    total: float
    status: str = "pending"
    payment_status: str = "pending"
    session_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OrderCreate(BaseModel):
    items: List[CartItem]

# Review Models
class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: Optional[str] = None
    user_id: Optional[str] = None
    name: str
    email: EmailStr
    rating: int = Field(ge=1, le=5)
    comment: str
    approved: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReviewCreate(BaseModel):
    product_id: Optional[str] = None
    name: str
    email: EmailStr
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewApproval(BaseModel):
    approved: bool

# Site Settings Models
class SiteSettings(BaseModel):
    brand_name: str = "Luxury Store"
    logo_url: str = ""
    contact_email: str = "info@luxurystore.com"
    contact_phone: str = "+1 (555) 123-4567"
    contact_address: str = "123 Luxury Ave, New York, NY 10001"
    about_text: str = "We are committed to delivering exceptional luxury products."
    facebook_url: str = ""
    instagram_url: str = ""

class SiteSettingsUpdate(BaseModel):
    brand_name: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    about_text: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": get_password_hash(user_data.password),
        "name": user_data.name,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_access_token({"sub": user_id, "email": user_data.email, "is_admin": False})
    
    return AuthResponse(
        token=token,
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name, is_admin=False)
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "is_admin": user.get("is_admin", False)
    })
    
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            is_admin=user.get("is_admin", False)
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        is_admin=user.get("is_admin", False)
    )

# ==================== PRODUCT ROUTES ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_admin)):
    product_doc = Product(**product.model_dump())
    await db.products.insert_one(product_doc.model_dump())
    return product_doc

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, updates: ProductUpdate, current_user: dict = Depends(get_current_admin)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
        product.update(update_data)
    
    return Product(**product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ==================== BANNER ROUTES ====================

@api_router.get("/banners", response_model=List[Banner])
async def get_banners():
    banners = await db.banners.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return banners

@api_router.get("/admin/banners", response_model=List[Banner])
async def get_all_banners(current_user: dict = Depends(get_current_admin)):
    banners = await db.banners.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return banners

@api_router.post("/admin/banners", response_model=Banner)
async def create_banner(banner: BannerCreate, current_user: dict = Depends(get_current_admin)):
    banner_doc = Banner(**banner.model_dump())
    await db.banners.insert_one(banner_doc.model_dump())
    return banner_doc

@api_router.put("/admin/banners/{banner_id}", response_model=Banner)
async def update_banner(banner_id: str, updates: BannerUpdate, current_user: dict = Depends(get_current_admin)):
    banner = await db.banners.find_one({"id": banner_id}, {"_id": 0})
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if update_data:
        await db.banners.update_one({"id": banner_id}, {"$set": update_data})
        banner.update(update_data)
    
    return Banner(**banner)

@api_router.delete("/admin/banners/{banner_id}")
async def delete_banner(banner_id: str, current_user: dict = Depends(get_current_admin)):
    result = await db.banners.delete_one({"id": banner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted"}

# ==================== CART ROUTES ====================

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    
    # Check if product exists
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = await db.cart_items.find_one({
        "user_id": user_id,
        "product_id": item.product_id
    })
    
    if existing_item:
        await db.cart_items.update_one(
            {"user_id": user_id, "product_id": item.product_id},
            {"$inc": {"quantity": item.quantity}}
        )
    else:
        await db.cart_items.insert_one({
            "user_id": user_id,
            "product_id": item.product_id,
            "quantity": item.quantity
        })
    
    return {"message": "Item added to cart"}

@api_router.get("/cart", response_model=CartResponse)
async def get_cart(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    cart_items = await db.cart_items.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    items = []
    total = 0.0
    
    for cart_item in cart_items:
        product = await db.products.find_one({"id": cart_item["product_id"]}, {"_id": 0})
        if product:
            items.append(CartItemResponse(
                product=Product(**product),
                quantity=cart_item["quantity"]
            ))
            total += product["price"] * cart_item["quantity"]
    
    return CartResponse(items=items, total=total)

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    result = await db.cart_items.delete_one({"user_id": user_id, "product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not in cart")
    return {"message": "Item removed from cart"}

@api_router.delete("/cart")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    await db.cart_items.delete_many({"user_id": user_id})
    return {"message": "Cart cleared"}

@api_router.put("/cart/{product_id}")
async def update_cart_quantity(product_id: str, item: CartItem, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    
    if item.quantity <= 0:
        await db.cart_items.delete_one({"user_id": user_id, "product_id": product_id})
    else:
        await db.cart_items.update_one(
            {"user_id": user_id, "product_id": product_id},
            {"$set": {"quantity": item.quantity}}
        )
    
    return {"message": "Cart updated"}

# ==================== ORDER & PAYMENT ROUTES ====================

@api_router.post("/checkout/create-session")
async def create_checkout_session(request: Request, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    user_email = current_user["email"]
    
    # Get cart items
    cart_items = await db.cart_items.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and prepare order items
    order_items = []
    total = 0.0
    
    for cart_item in cart_items:
        product = await db.products.find_one({"id": cart_item["product_id"]}, {"_id": 0})
        if product:
            order_items.append(OrderItem(
                product_id=product["id"],
                product_name=product["name"],
                price=product["price"],
                quantity=cart_item["quantity"]
            ))
            total += product["price"] * cart_item["quantity"]
    
    # Create order
    order_id = str(uuid.uuid4())
    order_doc = Order(
        id=order_id,
        user_id=user_id,
        user_email=user_email,
        items=order_items,
        total=total,
        status="pending",
        payment_status="pending"
    )
    
    # Get host URL from request
    host_url = str(request.base_url).rstrip('/')
    
    # Setup Stripe
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{host_url.replace('8001', '3000')}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url.replace('8001', '3000')}/cart"
    
    checkout_request = CheckoutSessionRequest(
        amount=total,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": order_id, "user_email": user_email}
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update order with session_id
    order_doc.session_id = session.session_id
    await db.orders.insert_one(order_doc.model_dump())
    
    # Create payment transaction
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "order_id": order_id,
        "user_id": user_id,
        "user_email": user_email,
        "amount": total,
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def check_payment_status(session_id: str, current_user: dict = Depends(get_current_user)):
    # Check if already processed
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.get("payment_status") == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "order_id": transaction["order_id"]
        }
    
    # Setup Stripe
    host_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Get status from Stripe
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and order
    if checkout_status.payment_status == "paid" and transaction.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": "complete"}}
        )
        
        order_id = transaction["order_id"]
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        
        if order:
            await db.orders.update_one(
                {"id": order_id},
                {"$set": {"payment_status": "paid", "status": "processing"}}
            )
            
            # Clear cart
            await db.cart_items.delete_many({"user_id": transaction["user_id"]})
            
            # Send confirmation email
            email_items = [{"name": item["product_name"], "quantity": item["quantity"], "price": item["price"]} for item in order["items"]]
            send_order_confirmation(transaction["user_email"], order_id, order["total"], email_items)
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "order_id": transaction["order_id"]
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Handle successful payment
        if webhook_response.payment_status == "paid":
            transaction = await db.payment_transactions.find_one(
                {"session_id": webhook_response.session_id},
                {"_id": 0}
            )
            
            if transaction and transaction.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete"}}
                )
                
                order_id = transaction["order_id"]
                await db.orders.update_one(
                    {"id": order_id},
                    {"$set": {"payment_status": "paid", "status": "processing"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ==================== ORDER ROUTES ====================

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    is_admin = current_user.get("is_admin", False)
    
    query = {"id": order_id}
    if not is_admin:
        query["user_id"] = user_id
    
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(current_user: dict = Depends(get_current_admin)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: dict, current_user: dict = Depends(get_current_admin)):
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status["status"]}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}

# ==================== REVIEW ROUTES ====================

@api_router.get("/reviews", response_model=List[Review])
async def get_reviews(product_id: Optional[str] = None):
    query = {"approved": True}
    if product_id:
        query["product_id"] = product_id
    
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    review_doc = Review(
        **review.model_dump(),
        user_id=current_user["sub"]
    )
    await db.reviews.insert_one(review_doc.model_dump())
    
    # Notify admin
    product_name = "General Review"
    if review.product_id:
        product = await db.products.find_one({"id": review.product_id}, {"_id": 0})
        if product:
            product_name = product["name"]
    
    send_review_notification("admin@luxurystore.com", review.name, product_name)
    
    return review_doc

@api_router.get("/admin/reviews", response_model=List[Review])
async def get_all_reviews(current_user: dict = Depends(get_current_admin)):
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return reviews

@api_router.put("/admin/reviews/{review_id}/approve")
async def approve_review(review_id: str, approval: ReviewApproval, current_user: dict = Depends(get_current_admin)):
    result = await db.reviews.update_one({"id": review_id}, {"$set": {"approved": approval.approved}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review updated"}

@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, current_user: dict = Depends(get_current_admin)):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

# ==================== SITE SETTINGS ROUTES ====================

@api_router.get("/settings", response_model=SiteSettings)
async def get_settings():
    settings = await db.site_settings.find_one({}, {"_id": 0})
    if not settings:
        # Return defaults
        return SiteSettings()
    return SiteSettings(**settings)

@api_router.put("/admin/settings", response_model=SiteSettings)
async def update_settings(updates: SiteSettingsUpdate, current_user: dict = Depends(get_current_admin)):
    settings = await db.site_settings.find_one({}, {"_id": 0})
    
    if settings:
        update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
        if update_data:
            await db.site_settings.update_one({}, {"$set": update_data})
            settings.update(update_data)
    else:
        settings = SiteSettings(**updates.model_dump(exclude_none=True))
        await db.site_settings.insert_one(settings.model_dump())
    
    return SiteSettings(**settings)

# ==================== CATEGORIES ROUTE ====================

@api_router.get("/categories")
async def get_categories():
    """Get unique product categories"""
    categories = await db.products.distinct("category")
    return categories

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
