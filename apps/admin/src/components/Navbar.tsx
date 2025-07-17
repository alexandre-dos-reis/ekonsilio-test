import { useUserContext } from "@/contexts/user";
import { authClient } from "@/utils/clients";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "react-toastify";

const AuthSection = () => {
  const { user, setUser } = useUserContext();

  const navigate = useNavigate();
  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar"
      >
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
          />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
      >
        <li>Logged as</li>
        <li className="break-all text-secondary">{user?.name}</li>
        <li>
          <a
            onClick={async (e) => {
              e.preventDefault();
              await authClient.signOut();
              setUser(null);
              toast("See you next time !", { type: "success" });
              navigate({ to: "/signin" });
            }}
          >
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
};

export const Navbar = () => {
  const { user } = useUserContext();

  return (
    <div className="sticky top-0 z-10 navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Admin Chat
        </Link>
      </div>
      <div className="flex-none">
        {user ? (
          <AuthSection />
        ) : (
          <div className="flex gap-3">
            <Link className="btn btn-primary" to="/signin">
              Sign In
            </Link>
            <Link className="btn btn-secondary" to="/signup">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
