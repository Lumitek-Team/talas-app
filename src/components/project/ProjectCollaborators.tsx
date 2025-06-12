import { ProjectUser } from "@/lib/type";
import { getPublicUrl } from "@/lib/utils";
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import Image from "next/image";
import Link from "next/link";

interface ProjectCollaboratorsProps {
  users: ProjectUser[];
}

export function ProjectCollaborators({ users }: ProjectCollaboratorsProps) {
  const owner = users.find((pu) => pu.ownership === 'OWNER');
  const collaborators = users.filter((pu) => pu.ownership === 'COLLABORATOR');

  return (
    <div className="my-6">
      <h3 className="text-lg font-bold mb-4 text-white">Project Members</h3>
      <ul className="space-y-4">
        {owner && (
          <li key={owner.user.id} className="flex items-center gap-4">
            <Link href={`/profile/${owner.user.username}`} className="flex-shrink-0">
              <Image
                  className="h-12 w-12 rounded-full"
                  src={getPublicUrl(owner.user.photo_profile) || '/img/dummy/profile-photo-dummy.jpg'}
                  alt={owner.user.name || "Owner"}
                  width={48}
                  height={48}
              />
            </Link>
            <div className="flex-1">
                <Link href={`/profile/${owner.user.username}`} className="font-bold text-white hover:underline">{owner.user.name}</Link>
                <p className="text-sm text-neutral-400">@{owner.user.username}</p>
            </div>
            <span className="inline-flex items-center gap-x-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                <CheckBadgeIcon className="h-4 w-4" />
                Owner
            </span>
          </li>
        )}
        {collaborators.map((c) => (
            <li key={c.user.id} className="flex items-center gap-4">
                <Link href={`/profile/${c.user.username}`} className="flex-shrink-0">
                    <Image
                        className="h-12 w-12 rounded-full"
                        src={getPublicUrl(c.user.photo_profile) || '/img/dummy/profile-photo-dummy.jpg'}
                        alt={c.user.name || "Collaborator"}
                        width={48}
                        height={48}
                    />
                </Link>
                <div className="flex-1">
                    <Link href={`/profile/${c.user.username}`} className="font-bold text-white hover:underline">{c.user.name}</Link>
                    <p className="text-sm text-neutral-400">@{c.user.username}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.collabStatus === 'ACCEPTED' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {c.collabStatus === 'ACCEPTED' ? 'Collaborator' : 'Pending'}
                </span>
            </li>
        ))}
      </ul>
    </div>
  )
}
