import Layout from "../../layouts/commonLayout/Layout";
import ExcelUploadGrid from "../../components/shared/ExcelUploadGrid";

export default function Questions() {
  return (
    <Layout role="admin" title="Question Bank">
      <ExcelUploadGrid
        title="Upload Questions"
        description="Import questions through Excel and review all records before publishing to sessions."
        uploadPath="/config/api/v1/kpiquestions/upload"
      />
    </Layout>
  );
}
