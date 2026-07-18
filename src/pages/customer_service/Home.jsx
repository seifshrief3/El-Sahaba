import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="space-y-6 bg-gray-50 p-10 rounded-xl shadow">
      <h1 className="text-xl font-semibold text-blue-950">
        نظرة سريعة على شغل خدمة العملاء.
      </h1>
      <div className="flex justify-around gap-4">
        <div className="flex flex-col w-[50vw] items-center gap-2 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p className="text-3xl font-bold tracking-tighter text-blue-950">4</p>
          <h3 className="md:text-lg text-sm font-medium text-blue-950">
            اجمالي الكولكشنات
          </h3>
        </div>
        <div className="flex flex-col w-[50vw] items-center gap-2 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p className="text-3xl font-bold tracking-tighter text-blue-950">1</p>
          <h3 className="md:text-lg text-sm font-medium text-blue-950">
            لسه مبدأش
          </h3>
        </div>
        <div className="flex flex-col w-[50vw] items-center gap-2 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p className="text-3xl font-bold tracking-tighter text-blue-950">2</p>
          <h3 className="md:text-lg text-sm font-medium text-blue-950">
            جاهزة للبدء
          </h3>
        </div>
      </div>
      <Link
        to="/customer_service/add_collection"
        className="rounded-3xl bg-red-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-900 cursor-pointer"
      >
        + كولكشن جديد
      </Link>
    </div>
  );
};

export default Home;
