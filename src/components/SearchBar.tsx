'use client'

import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/Command'
import { useQuery } from '@tanstack/react-query'
//@ts-ignore
import axios from 'axios'
//@ts-ignore
import { Prisma, Subreddit } from '@prisma/client'
import { usePathname, useRouter } from 'next/navigation'
//@ts-ignore
import { Users } from 'lucide-react'
import debounce from 'lodash.debounce'
import { useOnClickOutside } from '@/hooks/use-on-click-outside'

interface SearchBarProps {

}

export const SearchBar: FC<SearchBarProps> = ({ }) => {
    const [input, setInput] = useState<string>('')



    const { data: queryResults, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            if (!input) return []

            const { data } = await axios.get(`/api/search?q=${input}`)
            return data as (Subreddit & {
                _count: Prisma.SubredditCountOutputType
            })[]
        },
        queryKey: ['search-qurey'],
        enabled: false
    })

    const request = debounce(() => {
        refetch()
    }, 300)

    const debounceRequest = useCallback(() => {
        request()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const router = useRouter()
    const commandRef = useRef<HTMLDivElement>(null)
    const pathName = usePathname()

    useOnClickOutside(commandRef, () => {
        setInput('')
    })

    useEffect(() => {
        setInput('')
    }, [pathName])


    return (
        <Command ref={commandRef} className='relative z-50 max-w-lg overflow-visible border rounded-lg '>
            <CommandInput
                value={input}
                onValueChange={(text: string) => {
                    setInput(text)
                    debounceRequest()
                }}
                className='border-none outline-none focus:border-none focus:outline-none ring-0'
                placeholder='Search communities...'
            />

            {input.length > 0 ? (
                <CommandList className='absolute inset-x-0 bg-white shadow top-full rounded-b-md'>
                    {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
                    {(queryResults?.length ?? 0) > 0 ? (
                        <CommandGroup heading='communities'>
                            {queryResults?.map((subreddit) => (
                                <CommandItem onSelect={(e: any) => {
                                    router.push(`/r/${e}`)
                                    router.refresh()
                                }}
                                    key={subreddit.id}
                                    value={subreddit.name}
                                >
                                    <Users className='w-4 h-4 mr-2' />
                                    <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                                </CommandItem>

                            ))}
                        </CommandGroup>
                    ) : null}
                </CommandList>
            ) : null}
        </Command>
    )
}