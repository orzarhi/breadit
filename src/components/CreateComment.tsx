'use client'

import React, { FC, useState } from 'react'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { Button } from './ui/Button'
import { useMutation } from '@tanstack/react-query'
import { CommentRequest } from '@/lib/validators/comment'
import axios, { AxiosError } from 'axios'
import { useCustomToast } from '@/hooks/use-custom-toast'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface CreateCommentProps {
    postId: string
    replyToId?: string
}

export const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
    const [input, setInput] = useState<string>('')
    const { loginToast } = useCustomToast()
    const router = useRouter()


    const { mutate: comment, isLoading } = useMutation({
        mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
            const payload: CommentRequest = {
                postId,
                text,
                replyToId
            }

            const { data } = await axios.patch(`/api/subreddit/post/comment`, payload)
            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }
            return toast({
                title: 'Something went wrong.',
                description: 'Comment wemt wrong, Please try again later.',
                variant: 'destructive'
            })
        }, onSuccess: () => {
            router.refresh();
            setInput('')
        }
    })



    return (
        <div className='grid w-full gap-1.5'>
            <Label htmlFor='comment'>Your comment</Label>
            <div className='mt-2'>
                <Textarea
                    id='comment'
                    value={input}
                    onChange={({ target }) => setInput(target.value)}
                    rows={1}
                    placeholder='What are your thoughts?'
                />
                <div className='flex justify-end mt-2'>
                    <Button
                        isLoading={isLoading}
                        disabled={input.length === 0}
                        onClick={() => comment({ postId, text: input, replyToId })}
                    >
                        Post
                    </Button>
                </div>
            </div>
        </div>
    )
}