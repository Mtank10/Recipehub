import { gql, useMutation } from "@apollo/client";
import { GoogleLogin } from "@react-oauth/google";
import {useNavigate} from 'react-router-dom'

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
  const navigate = useNavigate()
  const handleGoogleLogin = async (response) => {
    if (!response.credential) {
      console.error("Google authentication failed");
      return;
    }

    // Decode Google Token (Optional)
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
    navigate('/')
    window.location.reload();
    
  };

  return isLoggedIn ? (
    <button
      onClick={handleLogout}
      className="bg-red-500 px-4 py-2 text-white rounded"
    >
      Logout
    </button>
  ) : (
    <div className="flex flex-col items-center space-y-3">
      <GoogleLogin onSuccess={handleGoogleLogin} onError={() => console.error("Google login failed")} />
    </div>
  );
};

export default AuthButton;
