import Layout from "../../layouts/commonLayout/Layout";
import ExcelUploadGrid from "../../components/shared/ExcelUploadGrid";

export default function CompanyData() {
  return (
    <Layout role="admin" title="Company Data">
      <ExcelUploadGrid
        title="Upload Company Data"
        description="Upload a company master file in Excel/CSV format and review records in the grid."
      />
    </Layout>
  );
}
