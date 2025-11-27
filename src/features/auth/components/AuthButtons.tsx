import { useLogin } from "./LoginProvider";
import { Link } from "react-router-dom";
import UserDropdown from "../../../components/header/UserDropdown";

const AuthButtons = () => {
  const { openLogin, user } = useLogin();

  if (user) {
    return <UserDropdown />;
  }

  return (
    <div className="flex space-x-4">
      <button
        onClick={openLogin}
        className="bg-transparent text-[#D1D1D1] border border-[#888] rounded-md px-8 py-2.5 hover:bg-[#D1D1D1]/20 transition cursor-pointer"
      >
        Sign In
      </button>

      <Link
        to="/signup"
        className="bg-[#bfbfbf] text-black font-bold rounded-md px-8 py-2.5 hover:bg-[#ededed] transition flex items-center justify-center"
      >
        Sign Up
      </Link>
    </div>
  );
};

export default AuthButtons;
