"use client";

import { RequestCollabType } from "@/lib/type";
import { getPublicUrl } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

interface CollaborationRequestCardProps {
  request: RequestCollabType;
}

export function CollaborationRequestCard({ request }: CollaborationRequestCardProps) {
  const { user } = useUser();
  const utils = trpc.useUtils();

  const projectOwner = request.project.project_user[0]?.user;

  const acceptMutation = trpc.collaboration.accept.useMutation({
    onSuccess: () => {
      // Invalidate queries to refetch data after accepting
      if(user?.id) {
        utils.user.getRequestCollab.invalidate(user.id);
        utils.project.getOne.invalidate({ id: request.project.id, id_user: user.id });
      }
    },
    onError: (error) => {
        alert(`Failed to accept: ${error.message}`); // Replace with a toast
    }
  });

  const rejectMutation = trpc.collaboration.reject.useMutation({
    onSuccess: () => {
       // Invalidate queries to refetch data after rejecting
       if(user?.id) {
        utils.user.getRequestCollab.invalidate(user.id);
       }
    },
     onError: (error) => {
        alert(`Failed to reject: ${error.message}`); // Replace with a toast
    }
  });

  const handleAccept = () => {
    acceptMutation.mutate(request.id);
  };

  const handleReject = () => {
    rejectMutation.mutate(request.id);
  };


  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-neutral-800 p-4 border border-neutral-700">
      <div className="flex items-center gap-4">
        <Image
          src={getPublicUrl(request.project.image1) || '/img/dummy/project-photo-dummy.jpg'}
          alt={request.project.title}
          width={56}
          height={56}
          className="rounded-md object-cover h-14 w-14"
        />
        <div className="text-sm">
          <p className="text-neutral-300">
            <span className="font-bold text-white">{projectOwner?.name || 'A user'}</span> has invited you to collaborate on the project:
          </p>
          <Link href={`/project/${request.project.slug}`} className="font-bold text-primary hover:underline">
            {request.project.title}
          </Link>
        </div>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <Button 
            variant="outline" 
            size="sm"
            onClick={handleReject}
            disabled={rejectMutation.isPending || acceptMutation.isPending}
        >
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
        </Button>
        <Button 
            variant="default" 
            size="sm"
            onClick={handleAccept}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
        >
            {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
        </Button>
      </div>
    </div>
  );
}
