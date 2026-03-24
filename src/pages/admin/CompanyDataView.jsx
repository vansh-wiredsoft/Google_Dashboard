import Layout from "../../layouts/commonLayout/Layout";
import EntityViewPage from "../../components/shared/EntityViewPage";
import { entityConfigs } from "../../data/adminEntityConfigs";

export default function CompanyDataView() {
  return (
    <Layout role="superadmin" title="View Company">
      <EntityViewPage {...entityConfigs.company} />
    </Layout>
  );
}
