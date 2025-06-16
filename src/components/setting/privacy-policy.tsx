export function PrivacyPolicyContent() {
  return (
    <div className="px-6 py-4 text-sm text-white space-y-4">
        <p>
            Talas values your privacy and is committed to protecting the personal data you share with us. By using our services, you agree to the following privacy policy:
        </p>
        <br />
        <div>
            <div className="flex items-center gap-2 mb-1">
            <span>1</span>
            <span className="font-semibold">Information we Collect:</span>
            </div>
            <ul className="list-disc list-inside ml-6 space-y-1">
                <li>Username and email</li>
                <li>Project content you upload</li>
                <li>Interaction data (like, comments, follows)</li>
            </ul>
        </div>
        <br />
        <div>
            <div className="flex items-center gap-2 mb-1">
            <span>2</span>
            <span className="font-semibold">How We Use Your Information:</span>
            </div>
            <ul className="list-disc list-inside ml-6 space-y-1">
                <li>To display your project and inetractions on the platform</li>
                <li>To provide notifications and feature improvements</li>
                <li>For security and system maintenance purposes</li>
            </ul>
        </div>
        <br />
        <div>
            <div className="flex items-center gap-2 mb-1">
            <span>3</span>
            <span className="font-semibold">Data Protection:</span>
            </div>
            <ul className="list-disc list-inside ml-6 space-y-1">
                <li>We use encryption and industry-standard security methods to protect your data.</li>
            </ul>
        </div>
        <br />
        <div>
            <div className="flex items-center gap-2 mb-1">
            <span>4</span>
            <span className="font-semibold">Your Rights:</span>
            </div>
            <ul className="list-disc list-inside ml-6 space-y-1">
                <li>You can edit or delete your account at any time.</li>
                <li>You may request permanent data deletion by contacting us.</li>
            </ul>
        </div>
        <br />
        <p>
            If you have any questions regarding privacy, please contact us at talaslumitek@gmail.com
        </p>

    </div>
  );
}
