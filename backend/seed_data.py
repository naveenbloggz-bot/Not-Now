import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Seeding database...")
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin_user = {
        "id": admin_id,
        "email": "admin@luxurystore.com",
        "password": pwd_context.hash("admin123"),
        "name": "Admin User",
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"email": "admin@luxurystore.com"})
    if not existing_admin:
        await db.users.insert_one(admin_user)
        print("✓ Admin user created (email: admin@luxurystore.com, password: admin123)")
    else:
        print("✓ Admin user already exists")
    
    # Create test user
    user_id = str(uuid.uuid4())
    test_user = {
        "id": user_id,
        "email": "user@test.com",
        "password": pwd_context.hash("password123"),
        "name": "Test User",
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_user = await db.users.find_one({"email": "user@test.com"})
    if not existing_user:
        await db.users.insert_one(test_user)
        print("✓ Test user created (email: user@test.com, password: password123)")
    else:
        print("✓ Test user already exists")
    
    # Create sample products
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Classic Watch",
            "description": "Timeless elegance with precision craftsmanship. A perfect blend of tradition and modernity.",
            "price": 299.00,
            "category": "Accessories",
            "images": ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Leather Handbag",
            "description": "Handcrafted Italian leather bag with exceptional attention to detail.",
            "price": 450.00,
            "category": "Accessories",
            "images": ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Designer Sunglasses",
            "description": "Premium UV protection with sophisticated styling.",
            "price": 189.00,
            "category": "Accessories",
            "images": ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Silk Scarf",
            "description": "Luxurious silk with hand-rolled edges and exclusive print.",
            "price": 125.00,
            "category": "Fashion",
            "images": ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Premium Wallet",
            "description": "Sleek design with RFID protection and superior craftsmanship.",
            "price": 95.00,
            "category": "Accessories",
            "images": ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Luxury Perfume",
            "description": "Exquisite fragrance with notes of jasmine and sandalwood.",
            "price": 175.00,
            "category": "Beauty",
            "images": ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cashmere Sweater",
            "description": "Ultra-soft cashmere in a timeless silhouette.",
            "price": 350.00,
            "category": "Fashion",
            "images": ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Diamond Necklace",
            "description": "Elegant 18k gold necklace with ethically sourced diamonds.",
            "price": 1200.00,
            "category": "Jewelry",
            "images": ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    existing_products = await db.products.count_documents({})
    if existing_products == 0:
        await db.products.insert_many(products)
        print(f"✓ {len(products)} products created")
    else:
        print(f"✓ Products already exist ({existing_products} products)")
    
    # Create banners
    banners = [
        {
            "id": str(uuid.uuid4()),
            "title": "Classic Watch",
            "description": "Timeless Elegance",
            "price": 299.00,
            "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920",
            "product_id": products[0]["id"],
            "order": 0,
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Luxury Handbags",
            "description": "Italian Craftsmanship",
            "price": 450.00,
            "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1920",
            "product_id": products[1]["id"],
            "order": 1,
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Premium Fashion",
            "description": "Elevate Your Style",
            "price": 350.00,
            "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920",
            "product_id": products[6]["id"],
            "order": 2,
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Fine Jewelry",
            "description": "Timeless Beauty",
            "price": 1200.00,
            "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920",
            "product_id": products[7]["id"],
            "order": 3,
            "active": True
        }
    ]
    
    existing_banners = await db.banners.count_documents({})
    if existing_banners == 0:
        await db.banners.insert_many(banners)
        print(f"✓ {len(banners)} banners created")
    else:
        print(f"✓ Banners already exist ({existing_banners} banners)")
    
    # Create approved reviews
    reviews = [
        {
            "id": str(uuid.uuid4()),
            "product_id": None,
            "user_id": user_id,
            "name": "Sarah Johnson",
            "email": "sarah@example.com",
            "rating": 5,
            "comment": "Exceptional quality and service. Every purchase has exceeded my expectations.",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "product_id": None,
            "user_id": user_id,
            "name": "Michael Chen",
            "email": "michael@example.com",
            "rating": 5,
            "comment": "The attention to detail is remarkable. True luxury at its finest.",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "product_id": None,
            "user_id": user_id,
            "name": "Emma Williams",
            "email": "emma@example.com",
            "rating": 5,
            "comment": "I've been a customer for years and they never disappoint. Highly recommended!",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    existing_reviews = await db.reviews.count_documents({})
    if existing_reviews == 0:
        await db.reviews.insert_many(reviews)
        print(f"✓ {len(reviews)} reviews created")
    else:
        print(f"✓ Reviews already exist ({existing_reviews} reviews)")
    
    # Site settings
    settings = {
        "brand_name": "LUXE",
        "logo_url": "",
        "contact_email": "info@luxestore.com",
        "contact_phone": "+1 (555) 123-4567",
        "contact_address": "123 Fifth Avenue, New York, NY 10001",
        "about_text": "We are committed to delivering exceptional luxury products that combine timeless elegance with modern sophistication. Every piece in our collection is carefully curated to bring you the finest quality and craftsmanship.",
        "facebook_url": "https://facebook.com",
        "instagram_url": "https://instagram.com"
    }
    
    existing_settings = await db.site_settings.find_one({})
    if not existing_settings:
        await db.site_settings.insert_one(settings)
        print("✓ Site settings created")
    else:
        print("✓ Site settings already exist")
    
    print("\n✅ Database seeding completed!")
    print("\nLogin Credentials:")
    print("Admin - Email: admin@luxurystore.com | Password: admin123")
    print("User  - Email: user@test.com | Password: password123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
