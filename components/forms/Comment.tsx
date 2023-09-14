"use client"

import * as z from "zod"
import { useForm } from "react-hook-form";
import {zodResolver} from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "../ui/input";
import { usePathname, useRouter } from "next/navigation";
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface Props {
    threadId: string;
    currentUserImage: string;
    currentUserId: string;
}

const Comment =  ({threadId, currentUserImage, currentUserId}: Props) => {
    const pathname = usePathname()
    const router = useRouter()

    const form = useForm<z.infer<typeof CommentValidation >>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: '',
        },
    });
    
    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(
            threadId,
            values.thread,
            JSON.parse(currentUserId),
            pathname
        )
    
        form.reset()
    }

    return (
        <div>
            <h1 className="text-white">Comment Form</h1>
            <Form {...form}>
                <form
                    className='comment-form'
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name='thread'
                        render={({ field }) => (
                            <FormItem className='flex w-full items-center gap-3'>
                                <FormLabel>
                                    <Image
                                        src={currentUserImage}
                                        alt="Profile Image"
                                        height={48}
                                        width={48}
                                        className="rounded-full object-cover"
                                    />
                                </FormLabel>
                                <FormControl className="border-none bg-transparent">
                                <Input
                                    type="text" 
                                    placeholder="Comment..."
                                    className="no-focus text-light-1 outline-none"
                                    {...field}
                                />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="comment-form_btn">
                        Reply
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default Comment