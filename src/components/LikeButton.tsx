'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { incrementLike } from '@/app/actions/like'

interface LikeButtonProps {
    postId: string
    initialLikes: number
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [isPending, setIsPending] = useState(false)
    const [hasLiked, setHasLiked] = useState(false)

    const handleLike = async () => {
        if (isPending || hasLiked) return

        setIsPending(true)
        try {
            // Optimistic UI update
            setLikes(prev => prev + 1)
            setHasLiked(true)

            const result = await incrementLike(postId)

            if (!result.success) {
                // Revert on failure
                setLikes(prev => prev - 1)
                setHasLiked(false)
                console.error(result.error)
            } else if (result.newCount && result.newCount !== likes + 1) {
                // Sync with actual count from server if it differs from optimistic update
                setLikes(result.newCount)
            }
        } catch (error) {
            // Revert on failure
            setLikes(prev => prev - 1)
            setHasLiked(false)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <button
            onClick={handleLike}
            disabled={isPending || hasLiked}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${hasLiked
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
        >
            <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likes}</span>
        </button>
    )
}
