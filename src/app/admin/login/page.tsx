export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#10141a] text-white">
      <div className="bg-[#181c23] p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <form className="flex flex-col gap-4">
          <input className="p-3 rounded bg-[#232a36] border border-gray-700" type="email" placeholder="Admin Email" required />
          <input className="p-3 rounded bg-[#232a36] border border-gray-700" type="password" placeholder="Password" required />
          <button className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded font-semibold mt-2">Login</button>
        </form>
      </div>
    </div>
  );
}
