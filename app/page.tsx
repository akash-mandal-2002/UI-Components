"use client"

import React, { useState } from 'react';
import AddButton from './components/AddButton/AddButton';
import Modal from './components/AddButton/Modal';

export default function App() {
  


  return (
    <div className="min-h-screen flex items-center bg-[#232E3C] justify-center space-x-24" id="main-playground">
        {/* <AddButton/> */}

        <Modal/>
    </div>
  );
}
