import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, Trash2, Loader2 } from "lucide-react";
import { supabase } from "../../../supabase"; // تأكد من مسار الـ supabase
import { toast } from "sonner";

export default function KnowledgeBase() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // === حط بيانات Cloudinary بتاعتك هنا ===
  const CLOUD_NAME = "el-sahaba"; // اسم الكلاود بتاعك (هتلاقيه في الداشبورد)
  const UPLOAD_PRESET = "El-Sahaba Knowledge-base"; // الاسم اللي عملناه في الخطوة الأولى (مثلاً: erp_docs)

  useEffect(() => {
    fetchFiles();
  }, []);

  // 1. جلب الملفات من الداتابيز
  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("حدث خطأ أثناء جلب الملفات");
    }
  };

  // 2. رفع الملف لـ Cloudinary ثم حفظه في Supabase
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // التأكد من نوع الملف
    if (file.type !== "application/pdf" && !file.name.endsWith(".docx")) {
      toast.error("يرجى رفع ملفات PDF أو Word فقط");
      return;
    }

    setIsUploading(true);
    toast.info("جاري رفع الملف... ⏳");

    try {
      // أ) رفع الملف لـ Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      // بنستخدم 'raw' عشان ده ملف مش صورة
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;

      const cloudinaryRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });
      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok)
        throw new Error(
          cloudinaryData.error?.message || "Cloudinary Upload Failed",
        );

      // حساب حجم الملف بالميجا
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";

      // ب) حفظ بيانات الملف في Supabase
      const { error: supabaseError } = await supabase
        .from("knowledge_base")
        .insert([
          {
            file_name: file.name,
            file_url: cloudinaryData.secure_url,
            file_size: fileSizeInMB,
          },
        ]);

      if (supabaseError) throw supabaseError;

      toast.success("تم رفع الملف بنجاح! ✨");
      fetchFiles(); // تحديث اللستة
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل رفع الملف، يرجى المحاولة مرة أخرى");
    } finally {
      setIsUploading(false);
      event.target.value = null; // تصفير الـ input
    }
  };

  // 3. حذف الملف من الداتابيز
  const handleDelete = async (id, fileName) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من حذف ${fileName}؟`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", id);
      if (error) throw error;

      toast.success("تم حذف الملف بنجاح");
      setFiles(files.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-arabic" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* الهيدر */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1a233a]">قاعدة المعرفة</h1>
          <p className="mt-2 text-sm text-slate-500">
            إدارة ملفات المصنع والمقالات الإرشادية التي يعتمد عليها الـ AI في
            الإجابة.
          </p>
        </section>

        {/* قسم الرفع */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-[#1a233a]">
            رفع ملفات مرجعية للـ AI
          </h2>

          <div className="relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition-colors hover:bg-slate-100">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            {isUploading ? (
              <div className="flex flex-col items-center text-[#1a233a]">
                <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                <p className="font-semibold">جاري الرفع...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <UploadCloud className="mb-2 h-10 w-10 text-blue-500" />
                <p className="font-semibold text-slate-600">
                  اسحب الملفات هنا أو اضغط للرفع (PDF, Docx)
                </p>
              </div>
            )}
          </div>

          {/* لستة الملفات المرفوعة */}
          <div className="mt-8 space-y-4">
            {files.length === 0 && !isUploading && (
              <p className="text-center text-sm text-slate-500">
                لا توجد ملفات مرفوعة حالياً.
              </p>
            )}

            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {/* زرار الحذف (على الشمال زي الصورة) */}
                <button
                  onClick={() => handleDelete(file.id, file.file_name)}
                  className="font-bold text-red-500 hover:text-red-700 transition"
                >
                  حذف
                </button>

                {/* تفاصيل الملف (على اليمين) */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#1a233a] hover:underline"
                    >
                      {file.file_name}
                    </a>
                    <p className="text-xs text-slate-400 mt-1">
                      منذ{" "}
                      {new Date(file.created_at).toLocaleDateString("ar-EG")} •{" "}
                      {file.file_size}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
