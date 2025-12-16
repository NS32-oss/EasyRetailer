"use client"

import { useState } from "react"
import { Dropdown } from "../ui/dropdown/Dropdown"
import { DropdownItem } from "../ui/dropdown/DropdownItem"
import { MoreDotIcon } from "../../icons"
import CountryMap from "./CountryMap"

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false)

  function toggleDropdown() {
    setIsOpen(!isOpen)
  }

  function closeDropdown() {
    setIsOpen(false)
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5 md:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">Customers Demographic</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-theme-sm">
            Number of customer based on country
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-5 sm:size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      {/* // Mobile-first: Reduced padding and responsive sizing */}
      <div className="px-3 py-4 my-4 overflow-hidden border border-gary-200 rounded-xl dark:border-gray-800 sm:px-4 sm:py-5 sm:my-6 md:px-6 md:py-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-3 -my-4 h-[180px] w-full sm:-mx-4 sm:-my-5 sm:h-[212px] md:-mx-6 md:-my-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="items-center w-full rounded-full max-w-6 sm:max-w-8">
              <img src="./images/country/country-01.svg" alt="usa" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-white/90 sm:text-theme-sm">USA</p>
              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">2,379 Customers</span>
            </div>
          </div>

          <div className="flex w-full max-w-[120px] items-center gap-2 sm:max-w-[140px] sm:gap-3">
            <div className="relative block h-2 w-full max-w-[80px] rounded-sm bg-gray-200 dark:bg-gray-800 sm:max-w-[100px]">
              <div className="absolute left-0 top-0 flex h-full w-[79%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
            </div>
            <p className="text-xs font-medium text-gray-800 dark:text-white/90 sm:text-theme-sm">79%</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="items-center w-full rounded-full max-w-6 sm:max-w-8">
              <img src="./images/country/country-02.svg" alt="france" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-white/90 sm:text-theme-sm">France</p>
              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">589 Customers</span>
            </div>
          </div>

          <div className="flex w-full max-w-[120px] items-center gap-2 sm:max-w-[140px] sm:gap-3">
            <div className="relative block h-2 w-full max-w-[80px] rounded-sm bg-gray-200 dark:bg-gray-800 sm:max-w-[100px]">
              <div className="absolute left-0 top-0 flex h-full w-[23%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
            </div>
            <p className="text-xs font-medium text-gray-800 dark:text-white/90 sm:text-theme-sm">23%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
