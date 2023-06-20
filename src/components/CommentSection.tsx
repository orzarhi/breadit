import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { PostComment } from "./PostComment"
import { CreateComment } from "./CreateComment"

interface CommentSectionProps {
    postId: string
}

export const CommentSection = async ({ postId }: CommentSectionProps) => {

    const session = await getAuthSession()

    const comments = await db.comment.findMany({
        where: {
            postId,
            replyToId: null
        },
        include: {
            author: true,
            votes: true,
            replies: {
                include: {
                    author: true,
                    votes: true
                }
            }
        }
    })

    return (
        <div className='flex flex-col mt-4 gap-y-4'>
            <hr className="w-full h-px my-6" />

            <CreateComment postId={postId} />
            <div className="flex flex-col mt-4 gap-y-6">
                {comments.filter((comment) => !comment.replyToId).map((topLevlComment) => {
                    const topLevelCommentVotesAmt = topLevlComment.votes.reduce((acc, vote) => {
                        if (vote.type === 'UP') return acc + 1
                        if (vote.type === 'DOWN') return acc - 1
                        return acc
                    }, 0)
                    const topLevelCommentVote = topLevlComment.votes.find((vote) => vote.userId === session?.user.id)

                    return <div key={topLevlComment.id} className="flex flex-col ">
                        <div className="mb-2">
                            <PostComment
                                postId={postId}
                                votesAmt={topLevelCommentVotesAmt}
                                currentVote={topLevelCommentVote}
                                comment={topLevlComment}
                            />
                        </div>
                    </div>
                })}
            </div>
        </div>
    )
}