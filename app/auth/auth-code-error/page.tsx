export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">
            There was a problem confirming your email address.
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>This could happen if:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>The confirmation link has expired</li>
            <li>The link has already been used</li>
            <li>There was a network issue</li>
          </ul>
        </div>

        <div className="space-y-4">
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try signing up again
          </a>
          <div>
            <a
              href="/login"
              className="text-sm text-muted-foreground hover:underline"
            >
              Already have an account? Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
