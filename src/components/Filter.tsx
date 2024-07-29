"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { MultiSelect } from "react-multi-select-component";
import "rc-slider/assets/index.css";
import { occasionOptions } from "../../constant";
import dynamic from "next/dynamic";
import { useQueryParams } from "@/hooks/useQueryParams";

const Select = dynamic(() => import("react-select"), { ssr: false });

const discountOptions = [
  { value: "", label: "None" },
  { value: "0-5", label: "From 0% to 5%" },
  { value: "6-10", label: "From 6% to 10%" },
  { value: "11-15", label: "From 11 to 15%" },
];

function Filter({ categories, brands }) {
  const searchParams = useQueryParams();
  const router = useRouter();

  const brandsOption = useMemo(() => {
    return brands.map((brand) => ({
      value: brand.id,
      label: brand.name,
    }));
  }, [brands]);

  const categoriesOption = useMemo(() => {
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

  const occasionOption = useMemo(() => {
    return occasionOptions.map((item) => ({
      value: item,
      label: item,
    }));
  }, []);

  const [categoriesSelected, setCategoriesSelected] = useState(() => {
    if (searchParams.get("categoryId")) {
      return searchParams
        .get("categoryId")
        ?.split(",")
        .map((categoryId) => ({
          value: +categoryId,
          label: categoriesOption.find(
            (option) => option.value === +categoryId
          ).label,
        }));
    } else {
      return [];
    }
  });

  const [selectedGender, setSelectedGender] = useState(
    () => searchParams.get("gender") || ""
  );

  const [sliderValue, setSliderValue] = useState(
    () => searchParams.get("range") || 2000
  );

  const [sliderChanged, setSliderChanged] = useState(false);

  const initialDiscountOptions = useMemo(() => {
    if (searchParams.get("discount")) {
      const value = searchParams.get("discount");
      if (!value) return discountOptions[0];
      const [from, to] = value?.split("-");
      return { value, label: `From ${from}% to ${to}%` };
    } else {
      return discountOptions[0];
    }
  }, []);

  const initialBrandOptions = useMemo(() => {
    if (searchParams.get("brandId")) {
      return searchParams
        .get("brandId")
        ?.split(",")
        .map((brandId) => ({
          value: +brandId,
          label: brandsOption.find((option) => option.value === +brandId)
            .label,
        }));
    } else {
      return [];
    }
  }, [brandsOption]);

  const initialOccasionOptions = useMemo(() => {
    if (searchParams.get("occasions")) {
      return searchParams
        .get("occasions")
        ?.split(",")
        .map((item) => ({ value: item, label: item }));
    } else {
      return [];
    }
  }, []);

  useEffect(() => {
    if (sliderChanged) {
      const handler = setTimeout(() => {
        searchParams.delete("page");
        searchParams.delete("pageSize");
        searchParams.set("range", `${sliderValue}`);
        router.push(`/products?${searchParams.toString()}`, { scroll: false });
      }, 300);

      return () => clearTimeout(handler);
    }
  }, [sliderValue]);

  function handleBrandsSelect(selectedOptions) {
    const selectedBrandIds = selectedOptions.map(option => option.value).join(',');
    const params = new URLSearchParams(searchParams.toString());
    if (selectedBrandIds) {
      params.set("brandId", selectedBrandIds.toString());
    } else {
      params.delete("brandId");
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  }

  function handleCategoriesSelected(selectedOptions) {
    setCategoriesSelected(selectedOptions);
    const selectedCategoryIds = selectedOptions.map(option => option.value).join(",");
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategoryIds) {
      params.set("categoryId", selectedCategoryIds);
    } else {
      params.delete("categoryId");
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  }

  function handleSlider(e) {
    setSliderValue(e.target.value);
    setSliderChanged(true);
  }

  const handleGenderChange = (e) => {
    const selectedGender = e.target.value;
    setSelectedGender(selectedGender);
    const params = new URLSearchParams(searchParams.toString());
    if (selectedGender) {
      params.set("gender", selectedGender);
    } else {
      params.delete("gender");
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  function handleOccasions(selectedOptions) {
    const selectedOccasions = selectedOptions.map(option => option.value).join(",");
    const params = new URLSearchParams(searchParams.toString());
    if (selectedOccasions) {
      params.set("occasions", selectedOccasions);
    } else {
      params.delete("occasions");
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  }

  function handleDiscount(selectedOption) {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedOption.value) {
      params.set("discount", selectedOption.value);
    } else {
      params.delete("discount");
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="w-full">
      <div className="w-1/4 flex items-center gap-4 mb-4">
        <span>Brands</span>
        <Select
          className="flex-1 text-black"
          options={brandsOption}
          isMulti
          name="brands"
          onChange={handleBrandsSelect}
          defaultValue={initialBrandOptions}
        />
      </div>
      <div className="w-1/3 flex items-center gap-4 mb-4">
        <span>Categories</span>
        <MultiSelect
          className="text-black flex-1"
          options={categoriesOption}
          value={categoriesSelected as []}
          labelledBy="categories select"
          hasSelectAll={false}
          onChange={handleCategoriesSelected}
        />
      </div>
      <div>
        <span>Select products from Range 1 to 2000</span>
        <br />
        <span>Current Value {sliderValue}</span> <br />
        <input
          type="range"
          step="50"
          min="100"
          max="2000"
          value={sliderValue}
          onChange={handleSlider}
        />
      </div>
      <div>
        Select Gender: <br />
        <input
          type="radio"
          id="none"
          name="gender"
          value=""
          checked={selectedGender === ""}
          onChange={handleGenderChange}
        />
        <label htmlFor="none">None</label> <br />
        <input
          type="radio"
          id="men"
          name="gender"
          value="men"
          checked={selectedGender === "men"}
          onChange={handleGenderChange}
        />
        <label htmlFor="men">Men</label>
        <br />
        <input
          type="radio"
          id="women"
          name="gender"
          value="women"
          checked={selectedGender === "women"}
          onChange={handleGenderChange}
        />
        <label htmlFor="women">Women</label>
        <br />
        <input
          type="radio"
          id="boy"
          name="gender"
          value="boy"
          checked={selectedGender === "boy"}
          onChange={handleGenderChange}
        />
        <label htmlFor="boy">Boy</label>
        <br />
        <input
          type="radio"
          id="girl"
          name="gender"
          value="girl"
          checked={selectedGender === "girl"}
          onChange={handleGenderChange}
        />
        <label htmlFor="girl">Girl</label>
      </div>
      <div className="w-1/4 flex items-center gap-4 mb-4">
        <span>Occasion</span>
        <Select
          className="flex-1 text-black"
          options={occasionOption}
          isMulti
          name="occasion"
          onChange={handleOccasions}
          defaultValue={initialOccasionOptions}
        />
      </div>
      <div className="w-1/4 flex items-center gap-4 mb-4">
        <span>Filter By discount</span>
        <Select
          className="flex-1 text-black"
          options={discountOptions}
          name="discount"
          defaultValue={initialDiscountOptions}
          onChange={handleDiscount}
        />
      </div>
    </div>
  );
}

export default Filter;

