import Header from "../header/header";
import BodyHomePage from "./bodyHomePage";

const HomePage: React.FC = () => {
  return (
    <div className="">
      <Header />
      <section className="">
        <BodyHomePage />
      </section>
    </div>
  );
};

export default HomePage;
