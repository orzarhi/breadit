import { formatTimeToNow } from '@/lib/utils'
import { Post as Posts, User, Vote } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import React, { FC, useRef } from 'react'
import { EditorOutput } from './EditorOutput'
import { PostVodeClient } from './post-vote/PostVodeClient'

type PartialVote = Pick<Vote, 'type'>

interface PostProps {
    subredditName: string
    post: Posts & {
        author: User,
        votes: Vote[]
    }
    commentAmt: number
    votesAmt: number
    currentVote?: PartialVote
}

export const Post: FC<PostProps> = ({ subredditName, post, commentAmt, votesAmt, currentVote }) => {

    const pRef = useRef<HTMLDivElement>(null)

    return (
        <main className='rounded-md bg-white shadow'>
            <div className='flex px-6 py-4 justify-between'>
                <PostVodeClient
                    postId={post.id}
                    initialVote={currentVote?.type}
                    initialVotesAmt={votesAmt}
                />

                <div className='w-0 flex-1'>
                    <div className='max-h-50 mt-1 text-xs text-gray-500'>
                        {subredditName ? (
                            <>
                                <a
                                    className='underline text-zinc-900 text-sm underline-offset-2'
                                    href={`/r/${subredditName}`}
                                >
                                    r/{subredditName}
                                </a>
                                <span className='px-1'>•</span>
                            </>
                        ) : null}
                        <span className='px-1'>Posted by u/{post?.author.name}</span>{' '}
                        {formatTimeToNow(new Date(post.createdAt))}
                    </div>
                    <a href={`/r/${subredditName}/post/${post.id}`}>
                        <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>{post.title}</h1>
                    </a>

                    <div
                        className='relative text-sm max-h-40 w-full overflow-clip'
                        ref={pRef}
                    >
                        <EditorOutput content={post.content} />
                        {pRef.current?.clientHeight === 160 ? (
                            <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent' />
                        ) : null}
                    </div>
                </div>
            </div>

            <div className='bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6'>
                <a className='w-fit flex items-center gap-2' href={`/r/${subredditName}/post/${post.id}`}>
                    <MessageSquare className='h-4 w-4' /> {commentAmt} comments
                </a>
            </div>
        </main>
    )
}