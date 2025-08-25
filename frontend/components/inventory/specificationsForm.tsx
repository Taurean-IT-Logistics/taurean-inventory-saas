"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryItem } from "@/types";

interface SpecificationsFormProps {
  formData: Partial<InventoryItem>;
  onSpecificationAdd: (key: string, value: string) => void;
  onSpecificationRemove: (key: string) => void;
}

const SpecificationsForm = ({
  formData,
  onSpecificationAdd,
  onSpecificationRemove,
}: SpecificationsFormProps) => {
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const handleAdd = () => {
    if (specKey.trim() && specValue.trim()) {
      onSpecificationAdd(specKey.trim(), specValue.trim());
      setSpecKey("");
      setSpecValue("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Specification name"
            value={specKey}
            onChange={(e) => setSpecKey(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAdd())
            }
            className="flex-1"
          />
          <Input
            type="text"
            placeholder="Specification value"
            value={specValue}
            onChange={(e) => setSpecValue(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAdd())
            }
            className="flex-1"
          />
          <Button type="button" onClick={handleAdd}>
            Add
          </Button>
        </div>

        {formData.specifications && formData.specifications.size > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Specification</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(formData.specifications.entries()).map(
                ([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{String(value)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSpecificationRemove(key)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SpecificationsForm;
