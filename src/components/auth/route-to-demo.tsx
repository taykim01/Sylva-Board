import Link from "next/link";

export default function RouteToDemo() {
  return (
    <div className="flex gap-2 polymath">
      <div className="text-r14 text-slate-700">Want to try Sylva without an account?</div>
      <Link href="/demo" className="text-m14 text-slate-500 underline cursor-pointer">
        Free Board
      </Link>
    </div>
  );
}
