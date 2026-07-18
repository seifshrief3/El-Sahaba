import React, { useState } from "react";
import CollectionDetails from "./CollectionDetails";

const Models = () => {
  const [view, setView] = useState("list");
  const [selectedCollection, setSelectedCollection] = useState("");

  const handleOpenCollection = (name) => {
    setSelectedCollection(name);
    setView("details");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* شاشة قائمة الكولكشنات */}
        {view === "list" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <p className="text-sm text-slate-500">الموديلات</p>
              <h1 className="mt-2 text-2xl font-bold text-[#1a365d]">
                الوضع العام للموديلات
              </h1>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                { id: "COL-1", name: "كولكشن 1", models: 65 },
                { id: "COL-2", name: "كولكشن الصيف", models: 24 },
              ].map((col) => (
                <div
                  key={col.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-xl font-bold text-[#1a365d]">
                      {col.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {col.models} موديل
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenCollection(col.name)}
                    className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors"
                  >
                    فتح الكولكشن
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* شاشة تفاصيل الموديلات (بتستدعي الكومبوننت اللي عملناه) */}
        {view === "details" && (
          <CollectionDetails
            collectionName={selectedCollection}
            onBack={() => setView("list")}
          />
        )}
      </div>
    </div>
  );
};

export default Models;
