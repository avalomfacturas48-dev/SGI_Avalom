"use client";

import RentalForm from "@/components/mantBuild/mantProperty/mantRent/rentForm";
import { ModeToggle } from "../../modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { useParams } from "next/navigation";
import { DateRangeCalculator } from "./DateRangeCalculator";

const BodyEditRent: React.FC = () => {
  const { alqId } = useParams();

  return (
    <div className="mx-auto p-4 space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Modificar alquiler
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ModeToggle />
        </div>
      </Card>

      <Card>
        <CardContent>
          <DateRangeCalculator />
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyEditRent;
