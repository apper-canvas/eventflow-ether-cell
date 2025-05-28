import { useState } from 'react'
import ApperIcon from './ApperIcon'

const StarRating = ({ rating = 0, onRatingChange, readonly = false, size = "w-5 h-5" }) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  const handleStarHover = (starRating) => {
    if (!readonly) {
      setHoverRating(starRating)
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setIsHovering(false)
      setHoverRating(0)
    }
  }

  const displayRating = isHovering ? hoverRating : rating

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating
        const isHalf = star === Math.ceil(displayRating) && displayRating % 1 !== 0
        
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            className={`transition-colors ${
              readonly 
                ? 'cursor-default' 
                : 'cursor-pointer hover:scale-110 transform transition-transform'
            }`}
          >
            {isHalf ? (
              <ApperIcon 
                name="StarHalf" 
                className={`${size} ${isFilled ? 'text-yellow-400' : 'text-surface-300'}`}
              />
            ) : (
              <ApperIcon 
                name="Star" 
                className={`${size} ${
                  isFilled 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-surface-300'
                }`}
              />
            )}
          </button>
        )
      })}
      
      {rating > 0 && (
        <span className="ml-2 text-sm text-surface-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default StarRating
