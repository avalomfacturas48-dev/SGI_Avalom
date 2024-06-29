import { useNavigate } from 'react-router-dom';

interface NavButtonProps {
  to: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ to, label }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      {label}
    </button>
  );
};

export default NavButton;
