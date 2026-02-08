import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { Product } from '../types/catalog'
import { formatMoney } from '../utils/money'

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (productId: string) => void
  inCart?: boolean
  quantity?: number
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  inCart = false,
  quantity = 0,
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!product || !isOpen) return null

  // Get all images (primary + additional)
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image]

  const nextImage = () => {
    setCurrentImageIndex((prev: number) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev: number) => (prev - 1 + allImages.length) % allImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const isInCart = Boolean(inCart || quantity > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-600 shadow-lg transition hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Section */}
          <div className="relative bg-gray-50">
            <div className="aspect-square overflow-hidden">
              <img
                src={allImages[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Image Navigation */}
            {allImages.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`h-2 w-2 rounded-full transition ${
                        index === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Cart Badge */}
            {isInCart && (
              <div className="absolute left-4 top-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-3 py-2 text-xs font-semibold text-brand-900 shadow-lg backdrop-blur">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  IN CART
                  <span className="rounded-full bg-brand-200 px-2 py-0.5 text-xs font-semibold">
                    x{quantity}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col p-6 lg:p-8">
            <div className="flex-1 space-y-6">
              {/* Title and Rating */}
              <div>
                <h1 className="font-display text-2xl leading-tight lg:text-3xl">
                  {product.name}
                </h1>
                {product.metal && (
                  <p className="mt-2 text-sm text-gray-600">{product.metal}</p>
                )}
                {product.rating && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1.5 text-sm text-yellow-800">
                      <Star className="h-4 w-4 fill-current" />
                      {product.rating.toFixed(1)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.rating >= 4.5 ? 'Excellent' : 
                       product.rating >= 4.0 ? 'Very Good' :
                       product.rating >= 3.5 ? 'Good' : 'Fair'}
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="border-b border-gray-200 pb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formatMoney(product.price, product.currency)}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Product ID</dt>
                    <dd className="text-sm font-medium text-gray-900">{product.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Category</dt>
                    <dd className="text-sm font-medium text-gray-900 capitalize">
                      {product.categoryId}
                    </dd>
                  </div>
                  {product.metal && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Material</dt>
                      <dd className="text-sm font-medium text-gray-900">{product.metal}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Currency</dt>
                    <dd className="text-sm font-medium text-gray-900">{product.currency}</dd>
                  </div>
                </dl>
              </div>

              {/* Image Gallery */}
              {allImages.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Gallery</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                          index === currentImageIndex
                            ? 'border-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} - Thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="mt-8 pt-6">
              <button
                onClick={() => onAddToCart(product.id)}
                className={`w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 active:scale-[0.98] ${
                  isInCart 
                    ? 'bg-brand-800 hover:bg-brand-900' 
                    : 'bg-brand-900 hover:bg-black'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isInCart ? (
                    <>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{quantity > 0 ? `Add Another (${quantity} in cart)` : 'Add to Cart'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </div>
              </button>
              
              {isInCart && (
                <div className="mt-3 text-center">
                  <span className="text-sm text-brand-700 font-medium">
                    ✓ {quantity} item{quantity > 1 ? 's' : ''} in your cart
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
