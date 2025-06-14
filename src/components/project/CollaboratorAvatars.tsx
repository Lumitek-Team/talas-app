import { ProjectUser } from "@/lib/type";
import { getPublicUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { UsersIcon } from '@heroicons/react/24/solid';

interface CollaboratorAvatarsProps {
  users: ProjectUser[];
  maxVisible?: number;
}

export function CollaboratorAvatars({ users, maxVisible = 3 }: CollaboratorAvatarsProps) {
  // Filter for accepted collaborators and exclude the owner
  const acceptedCollaborators = users.filter(
    (pu) => pu.ownership === 'COLLABORATOR' && pu.collabStatus === 'ACCEPTED'
  );

  if (acceptedCollaborators.length === 0) {
    return null; // Don't render anything if there are no accepted collaborators
  }

  const visibleCollaborators = acceptedCollaborators.slice(0, maxVisible);
  const hiddenCount = acceptedCollaborators.length - visibleCollaborators.length;

  return (
    <div className="flex items-center" data-prevent-card-click="true">
        <div className="flex -space-x-2 overflow-hidden">
            {visibleCollaborators.map((collaborator) => (
                <Link 
                    href={`/profile/${collaborator.user.username}`} 
                    key={collaborator.user.id}
                    onClick={(e) => e.stopPropagation()}
                    title={collaborator.user.name || collaborator.user.username || 'User'}
                >
                    <Image
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-background"
                        src={getPublicUrl(collaborator.user.photo_profile) || '/img/dummy/profile-photo-dummy.jpg'}
                        alt={collaborator.user.name || "Collaborator"}
                        width={28}
                        height={28}
                        onError={(e) => { e.currentTarget.src = '/img/dummy/profile-photo-dummy.jpg'; }}
                    />
                </Link>
            ))}
            {hiddenCount > 0 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-700 ring-2 ring-background">
                    <span className="text-xs font-medium text-neutral-300">+{hiddenCount}</span>
                </div>
            )}
        </div>
        <UsersIcon className="h-4 w-4 ml-2 text-neutral-400" />
    </div>
  );
}
