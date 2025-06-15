import { gql, useMutation } from "@apollo/client";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { FaSignOutAlt, FaGoogle } from "react-icons/fa";

const LOGIN = gql`
  mutation Login($providerId: String!, $name: String!, $email: String!, $avatar: String!) {
    googleLogin(providerId: $providerId, name: $name, email: $email, avatar: $avatar) {
      token
      user {
        id
        name
        email
        avatar
      }
    }
  }
`;

const LOGOUT = gql`
  mutation Logout{
    logout
  }
`;

const AuthButton = ({ isLoggedIn }) => {
  const [login] = useMutation(LOGIN);
  const [logout] = useMutation(LOGOUT);
  const navigate = useNavigate();

  const handleGoogleLogin = async (response) => {
    if (!response.credential) {
      console.error("Google authentication failed");
      return;
    }

    const payload = JSON.parse(atob(response.credential.split(".")[1]));
    const { sub: providerId, name, email, picture: avatar } = payload;

    try {
      const { data } = await login({
        variables: { providerId, name, email, avatar },
      });

      if (data?.googleLogin?.token) {
        localStorage.setItem("token", data.googleLogin.token);
        window.location.reload();
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    navigate('/');
    window.location.reload();
  };

  return isLoggedIn ? (
    <motion.button
      onClick={handleLogout}
      className="flex items-center gap-3 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaSignOutAlt />
      <span>Sign Out</span>
    </motion.button>
  ) : (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center mb-2">
        <FaGoogle className="text-3xl mx-auto mb-2" style={{ color: 'var(--sage-green)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--dark-text)' }}>
          Sign in to save recipes & more
        </p>
      </div>
      <GoogleLogin 
        onSuccess={handleGoogleLogin} 
        onError={() => console.error("Google login failed")}
        theme="filled_blue"
        size="large"
        text="signin_with"
        shape="pill"
      />
    </div>
  );
};

export default AuthButton;