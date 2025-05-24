
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag } from "lucide-react";

interface Country {
  code: string;
  name: string;
  flag: string;
}

const eastAfricanCountries: Country[] = [
  { code: "uganda", name: "Uganda", flag: "🇺🇬" },
  { code: "kenya", name: "Kenya", flag: "🇰🇪" },
  { code: "tanzania", name: "Tanzania", flag: "🇹🇿" },
  { code: "rwanda", name: "Rwanda", flag: "🇷🇼" },
  { code: "burundi", name: "Burundi", flag: "🇧🇮" },
  { code: "south-sudan", name: "South Sudan", flag: "🇸🇸" }
];

interface CountryDropdownProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export const CountryDropdown = ({ selectedCountry, onCountryChange }: CountryDropdownProps) => {
  const currentCountry = eastAfricanCountries.find(country => country.code === selectedCountry);

  return (
    <Select value={selectedCountry} onValueChange={onCountryChange}>
      <SelectTrigger className="w-48 bg-white">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentCountry?.flag}</span>
            <span>{currentCountry?.name || "Select Country"}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border shadow-lg">
        {eastAfricanCountries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
