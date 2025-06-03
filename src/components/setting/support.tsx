export function SupportContent() {
  return (
    <div className="px-6 py-4 text-sm text-white space-y-4">
        <p>
            We are here to help you if you encounter any issues while using the Talas platform.
        </p>
        <br />
        <div>
            <div className="flex items-center gap-2 mb-1">
            <span>🔧</span>
            <span className="font-semibold">Support We Offer:</span>
            </div>
            <ul className="list-disc list-inside ml-6 space-y-1">
            <li>Technical issues (login, project upload, bugs)</li>
            <li>Questions about features</li>
            <li>Account deletion or data removal requests</li>
            </ul>
        </div>
        <br />
        <div>
            <div className="flex items-center gap-2 mb-1">
            <span>📮</span>
            <span className="font-semibold">How to Contact Us:</span>
            </div>
            <ul className="list-disc list-inside ml-6 space-y-1">
            <li>Email: <a href="mailto:talaslumitek@gmail.com" className="underline">talaslumitek@gmail.com</a></li>
            <li>Help form on the profile page</li>
            <li>Reply directly to a related notification</li>
            </ul>
        </div>
    </div>
  );
}
