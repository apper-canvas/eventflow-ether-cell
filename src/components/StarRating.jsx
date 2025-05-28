import { useState } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from './ApperIcon'

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'w-5 h-5' }) => {
  const [hoverRating, setHoverRating] = useState(0)
  
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={!readonly ? { scale: 1.1 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          disabled={readonly}
        >
          <ApperIcon
            name="Star"
            className={`${size} transition-colors ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </motion.button>
      ))}
      {readonly && (
        <span className="ml-2 text-sm text-surface-600">
          {rating.toFixed(1)} reviews
        </span>
      )}
    </div>
  )
}

export default StarRating
