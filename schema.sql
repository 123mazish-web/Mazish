-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    images TEXT[] NOT NULL DEFAULT '{}',
    category TEXT NOT NULL DEFAULT 'Sunglasses',
    stock INTEGER NOT NULL DEFAULT 10,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'COD', -- 'COD' or 'bKash' or 'Nagad'
    payment_details TEXT, -- e.g., bKash transaction ID if manual
    total_amount NUMERIC(10, 2) NOT NULL,
    items JSONB NOT NULL, -- list of { id, name, price, quantity, image }
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
    steadfast_consignment_id TEXT, -- Steadfast Courier consignment tracking ID
    steadfast_tracking_code TEXT, -- Steadfast Courier tracking code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read to products
CREATE POLICY "Allow public read to products" ON public.products
    FOR SELECT TO anon USING (true);

-- Allow anonymous insert to orders (for checkout)
CREATE POLICY "Allow public insert to orders" ON public.orders
    FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous read to order (for tracking page)
CREATE POLICY "Allow public read to orders" ON public.orders
    FOR SELECT TO anon USING (true);

-- Full access for authenticated (admin) roles on products and orders
CREATE POLICY "Allow admin full access to products" ON public.products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin full access to orders" ON public.orders
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
