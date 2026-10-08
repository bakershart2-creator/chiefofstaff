export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/", error } = await searchParams;
  return (
    <main className="wrap">
      <div className="eyebrow">Brown Sugar Bakery</div>
      <h1>Chief of Staff</h1>
      <form method="post" action="/api/login">
        <input type="hidden" name="next" value={next} />
        <input className="input" name="password" type="password" placeholder="Password" autoFocus required />
        <p><button className="btn" style={{ width: "100%" }}>Open my brief</button></p>
        {error && <p className="err">That password didn't work. Try again.</p>}
      </form>
    </main>
  );
}
