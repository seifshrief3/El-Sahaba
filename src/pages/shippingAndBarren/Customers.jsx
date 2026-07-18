import React, { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import AddNewCustomer from "../../Modals/AddNewCustomer";
import ViewCustomer from "../../Modals/ViewCustomer";

const Customers = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const openModal = (type, customer = null) => {
    setSelectedCustomer(customer);
    setActiveModal(type);
  };

  const customers = [
    {
      id: 1,
      brand: "Nike",
      name: "ستور القاهرة",
      phone: "01012345678",
      governorate: "القاهرة",
      manager: "محمد أحمد",
      shipments: 12,
    },
    {
      id: 2,
      brand: "Adidas",
      name: "فرع الإسكندرية",
      phone: "01198765432",
      governorate: "الإسكندرية",
      manager: "أحمد علي",
      shipments: 7,
    },
    {
      id: 3,
      brand: "Puma",
      name: "Fashion Store",
      phone: "01222222222",
      governorate: "الجيزة",
      manager: "محمود حسن",
      shipments: 4,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              عملاء البراندات
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              إدارة العملاء الذين يتم الشحن إليهم لكل براند.
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 rounded-2xl bg-red-800 px-5 py-3 text-sm font-semibold text-white hover:bg-red-900"
          >
            <Plus size={18} /> إضافة عميل
          </button>
        </div>
      </section>
      {/* Search */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="بحث باسم العميل..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none"
            />
          </div>

          <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <option>كل البراندات</option>
            <option>Nike</option>
            <option>Adidas</option>
            <option>Puma</option>
          </select>

          <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <option>كل المحافظات</option>
            <option>القاهرة</option>
            <option>الجيزة</option>
            <option>الإسكندرية</option>
          </select>
        </div>
      </section>
      {/* Table */}
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr className="text-right text-sm text-slate-600">
                <th className="px-6 py-4">البراند</th>
                <th className="px-6 py-4">اسم العميل</th>
                <th className="px-6 py-4">الهاتف</th>
                <th className="px-6 py-4">المحافظة</th>
                <th className="px-6 py-4">المسؤول</th>
                <th className="px-6 py-4">عدد الشحنات</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t hover:bg-slate-50">
                  <td className="px-6 py-4">{customer.brand}</td>
                  <td className="px-6 py-4">{customer.name}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4">{customer.governorate}</td>
                  <td className="px-6 py-4">{customer.manager}</td>
                  <td className="px-6 py-4">{customer.shipments}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openModal("view", customer)}
                        className="rounded-xl bg-slate-100 p-2"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="rounded-xl bg-red-100 p-2 text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals Rendering */}
      {activeModal === "add" && (
        <AddNewCustomer setOpenModal={() => setActiveModal(null)} />
      )}
      {activeModal === "view" && (
        <ViewCustomer
          customer={selectedCustomer}
          setOpenModal={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default Customers;
