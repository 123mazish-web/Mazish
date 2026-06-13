const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing in .env.local.")
  process.exit(1)
}

const ws = require('ws')
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: {
    transport: ws
  }
})

const DEFAULT_CATEGORIES = [
  { name: "Sunglasses" },
  { name: "Apparel" },
  { name: "Accessories" },
  { name: "FIFA Special Edition" }
]

const DEFAULT_PRODUCTS = [
  {
    name: "MAZISH Classic Aviator",
    description: "Handcrafted lightweight metal frame. Features scratch-resistant polarized lenses that provide 100% UV protection. Designed for the ultimate luxury statement.",
    price: 1400,
    discount_price: 950,
    images: ["/images/Sunglass1.png"],
    category: "Sunglasses",
    gender: "Men",
    stock: 25,
    is_featured: true
  },
  {
    name: "MAZISH Onyx Shadow",
    description: "Deep obsidian black acetate frame with gradient dark lenses. A classic, timeless silhouette that exudes authority and mystery.",
    price: 1400,
    discount_price: 950,
    images: ["/images/Sunglass2.png"],
    category: "Sunglasses",
    gender: "Unisex",
    stock: 18,
    is_featured: true
  },
  {
    name: "MAZISH Lumina Rose",
    description: "Translucent rose gold frame paired with soft-tinted mirrored lenses. Highly durable double-bridge construction offering unmatched comfort.",
    price: 1400,
    discount_price: 950,
    images: ["/images/Sunglass3.png"],
    category: "Sunglasses",
    gender: "Women",
    stock: 15,
    is_featured: true
  },
  {
    name: "MAZISH Mirage Silver",
    description: "Silver hexagonal frame with blue-gradient lenses. Extremely lightweight construction using surgical-grade stainless steel.",
    price: 1400,
    discount_price: 950,
    images: ["/images/Sunglass4.png"],
    category: "Sunglasses",
    gender: "Unisex",
    stock: 20,
    is_featured: true
  },
  {
    name: "MAZISH Elysian Amber",
    description: "Tortoiseshell patterned acetate frame with amber tinted lenses. A warm, vintage-inspired design that complements any modern luxury wardrobe.",
    price: 1400,
    discount_price: 950,
    images: ["/images/Sunglass5.png"],
    category: "Sunglasses",
    gender: "Unisex",
    stock: 12,
    is_featured: false
  },
  {
    name: "MAZISH Stealth Sport",
    description: "Sleek aerodynamic wrap-around frames built for active luxury. Polarized high-contrast lenses for maximum clarity.",
    price: 1400,
    discount_price: 950,
    images: ["/images/Sunglass6.png"],
    category: "Sunglasses",
    gender: "Men",
    stock: 30,
    is_featured: false
  },
  {
    name: "MAZISH Retro Browline",
    description: "Clubmaster-style frames combining premium tortoiseshell acetate with gold metal accents. Exudes academic luxury.",
    price: 1400,
    discount_price: 950,
    images: ["/images/Sunglass7.png"],
    category: "Sunglasses",
    gender: "Men",
    stock: 14,
    is_featured: false
  },
  {
    name: "MAZISH Cyber Edge",
    description: "Rimless futuristic shields with iridescent violet-to-blue gradient lenses. Express your unique cyberpunk luxury look.",
    price: 1400,
    discount_price: 950,
    images: ["/images/Sunglass8.png"],
    category: "Sunglasses",
    gender: "Women",
    stock: 10,
    is_featured: false
  },
  {
    name: "MAZISH Handcrafted Brazil Edition",
    description: "Special FIFA Edition. Show your pride for the Seleção with this handcrafted luxury piece featuring signature green and gold acetate details and polarized golden-yellow gradient lenses.",
    price: 1400,
    discount_price: 950,
    images: ["/images/BrazilGlass.jpg"],
    category: "FIFA Special Edition",
    gender: "Unisex",
    stock: 50,
    is_featured: true
  },
  {
    name: "MAZISH Handcrafted Argentina Edition",
    description: "Special FIFA Edition. Celebrate the Albiceleste with this handcrafted luxury frame featuring pristine sky-blue and white accents, fitted with high-contrast polarized lenses.",
    price: 1400,
    discount_price: 950,
    images: ["/images/ArgentinaGlass.jpg"],
    category: "FIFA Special Edition",
    gender: "Unisex",
    stock: 50,
    is_featured: true
  }
]

async function seed() {
  console.log("Cleaning products...")
  await supabase.from('products').delete().gt('price', 0)

  console.log("Cleaning categories...")
  await supabase.from('categories').delete().neq('name', '')

  console.log("Seeding categories...")
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .insert(DEFAULT_CATEGORIES)
    .select()

  if (catError) {
    console.error("Error seeding categories:", catError.message)
  } else {
    console.log(`Seeded ${catData.length} categories.`)
  }

  console.log("Seeding products...")
  const { data, error } = await supabase
    .from('products')
    .insert(DEFAULT_PRODUCTS)
    .select()

  if (error) {
    console.error("Error inserting products:", error.message)
  } else {
    console.log(`Successfully seeded ${data.length} products into Supabase!`)
  }
}

seed()
