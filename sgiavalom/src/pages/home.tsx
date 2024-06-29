import { useEffect, useState } from "react";
import NavButton from "../components/navButton";

function Home() {
  const [data, setData] = useState<{ id: number; valor1: string; valor2: number; }[]>([]);

  useEffect(() => {
    const generateRandomData = () => {
      const newData = Array.from({ length: 5 }, (_, index) => ({
        id: index + 1,
        valor1: `Valor ${index + 1}`,
        valor2: Math.floor(Math.random() * 100),
      }));
      setData(newData);
    };

    generateRandomData();
  }, []); // El array vacío como segundo argumento indica que se ejecuta solo al montarse el componente

  return (
    <div>
      <h1>Home Page</h1>
      <NavButton to="/about" label="Go to About" />
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Valor 1</th>
            <th>Valor 2</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.valor1}</td>
              <td>{item.valor2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Home;
