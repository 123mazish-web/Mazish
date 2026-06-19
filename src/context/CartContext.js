'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mazish_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart data', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mazish_cart', JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addToCart = (product, quantity = 1) => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ ecommerce: null })
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'BDT',
          value: (product.discount_price || product.price) * quantity,
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.discount_price || product.price,
            item_category: product.category,
            item_gender: product.gender,
            quantity: quantity
          }]
        }
      })
    }
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id)
      if (existingItemIndex > -1) {
        const newCart = [...prevCart]
        newCart[existingItemIndex].quantity += quantity
        return newCart
      } else {
        return [...prevCart, { ...product, quantity }]
      }
    })
  }

  const removeFromCart = (productId) => {
    const item = cart.find(i => i.id === productId)
    if (item && typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ ecommerce: null })
      window.dataLayer.push({
        event: 'remove_from_cart',
        ecommerce: {
          currency: 'BDT',
          value: (item.discount_price || item.price) * item.quantity,
          items: [{
            item_id: item.id,
            item_name: item.name,
            price: item.discount_price || item.price,
            item_category: item.category,
            item_gender: item.gender,
            quantity: item.quantity
          }]
        }
      })
    }
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + ((item.discount_price || item.price) * item.quantity), 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
