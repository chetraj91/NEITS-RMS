import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { getCustomers } from "../api/customer";

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  email?: string;
};

type Props = {
  onSelect: (customer: Customer | null) => void;
};

export default function CustomerSearch({ onSelect }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const res = await getCustomers();
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Autocomplete
      options={customers}
      getOptionLabel={(option) =>
        `${option.fullName} (${option.phone})`
      }
      onChange={(_, value) => onSelect(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Customer"
          placeholder="Type customer name..."
        />
      )}
    />
  );
}

