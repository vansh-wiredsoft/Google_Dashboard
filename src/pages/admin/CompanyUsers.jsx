import Layout from "../../layouts/commonLayout/Layout";
import ExcelUploadGrid from "../../components/shared/ExcelUploadGrid";

export default function CompanyUsers() {
  return (
    <Layout role="admin" title="Company User Data">
      <ExcelUploadGrid
        title="Upload Company User Data"
        description="Upload employee or candidate data mapped to companies and validate in the table."
      />
    </Layout>
  );
}
