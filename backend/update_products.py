import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def update_products():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Updating products...")
    
    # Delete all existing products
    await db.products.delete_many({})
    print("✓ Deleted all existing products")
    
    # Create new products with uploaded images
    new_products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Drawstring Bag - Blue",
            "description": "Premium quality drawstring bag with front zip pocket. Perfect for gym, travel, or everyday use. Water-resistant material with adjustable straps.",
            "price": 29.99,
            "category": "Bags",
            "images": ["https://customer-assets.emergentagent.com/job_luxury-minimal-shop/artifacts/ndgzocr5_Draw%20string%20Bag.jpeg"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Drawstring Bag - Black",
            "description": "Premium quality drawstring bag with front zip pocket in classic black. Perfect for gym, travel, or everyday use. Water-resistant material with adjustable straps.",
            "price": 29.99,
            "category": "Bags",
            "images": ["https://customer-assets.emergentagent.com/job_luxury-minimal-shop/artifacts/ds66l173_Drawstring%20bag_black.jpeg"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Winter Jacket - Black",
            "description": "Stay Warm. Stay Stylish. Limited Edition Drop. Premium puffer jacket with front pockets and superior insulation. Perfect for cold weather.",
            "price": 149.99,
            "category": "Jackets",
            "images": ["https://customer-assets.emergentagent.com/job_luxury-minimal-shop/artifacts/w8otw08d_Winter_jackets_black.jpeg"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Winter Jacket - Brown",
            "description": "Stay Warm. Stay Stylish. Limited Edition Drop. Premium puffer jacket in classic brown with front pockets and superior insulation. Perfect for cold weather.",
            "price": 149.99,
            "category": "Jackets",
            "images": ["https://customer-assets.emergentagent.com/job_luxury-minimal-shop/artifacts/xq3e8hh2_Winter_jackets_brown.jpeg"],
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(new_products)
    print(f"✓ Added {len(new_products)} new products")
    
    # Update banners with new products
    await db.banners.delete_many({})
    print("✓ Deleted all existing banners")
    
    new_banners = [
        {
            "id": str(uuid.uuid4()),
            "title": "Winter Jacket - Black",
            "description": "Stay Warm. Stay Stylish",
            "price": 149.99,
            "image_url": "https://customer-assets.emergentagent.com/job_luxury-minimal-shop/artifacts/w8otw08d_Winter_jackets_black.jpeg",
            "product_id": new_products[2]["id"],
            "order": 0,
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Winter Jacket - Brown",
            "description": "Limited Edition Drop",
            "price": 149.99,
            "image_url": "https://customer-assets.emergentagent.com/job_luxury-minimal-shop/artifacts/xq3e8hh2_Winter_jackets_brown.jpeg",
            "product_id": new_products[3]["id"],
            "order": 1,
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Drawstring Bag - Blue",
            "description": "Premium Quality",
            "price": 29.99,
            "image_url": "https://customer-assets.emergentagent.com/job_luxury-minimal-shop/artifacts/ndgzocr5_Draw%20string%20Bag.jpeg",
            "product_id": new_products[0]["id"],
            "order": 2,
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Drawstring Bag - Black",
            "description": "Versatile & Durable",
            "price": 29.99,
            "image_url": "https://customer-assets.emergentagent.com/job_luxury-minimal-shop/artifacts/ds66l173_Drawstring%20bag_black.jpeg",
            "product_id": new_products[1]["id"],
            "order": 3,
            "active": True
        }
    ]
    
    await db.banners.insert_many(new_banners)
    print(f"✓ Added {len(new_banners)} new banners")
    
    print("\n✅ Products and banners updated successfully!")
    print("\nNew Products:")
    for p in new_products:
        print(f"  - {p['name']}: ${p['price']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_products())
