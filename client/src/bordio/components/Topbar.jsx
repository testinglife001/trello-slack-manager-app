// src/components/Topbar.jsx
import React from "react";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";

export default function Topbar() {
  return (
    <div className="flex justify-between items-center p-4 bg-white border-b">
      <div className="flex items-center space-x-2">
        <Button className="bg-blue-500 text-white">+ Add New</Button>
        <select className="border rounded p-1">
          <option>Today</option>
          <option>Tomorrow</option>
        </select>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">12</span>
        </button>

        <div className="flex -space-x-2">
          <Avatar src="/assets/images/user1.jpg" alt="User1" size="8"/>
          <Avatar src="/assets/images/user2.jpg" alt="User2" size="8"/>
          <Avatar src="/assets/images/user3.jpg" alt="User3" size="8"/>
        </div>
      </div>
    </div>
  );
}