import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../layouts/commonLayout/Layout";
import EntityFormPage from "../../components/shared/EntityFormPage";
import { entityConfigs } from "../../data/adminEntityConfigs";
import { fetchCompanies } from "../../store/companySlice";

export default function CompanyUsersForm({ mode }) {
  const dispatch = useDispatch();
  const companies = useSelector((state) => state.company.companies);

  useEffect(() => {
    if (companies.length === 0) {
      dispatch(fetchCompanies());
    }
  }, [companies.length, dispatch]);

  const config = useMemo(
    () => ({
      ...entityConfigs.user,
      fields: entityConfigs.user.fields.map((field) =>
        field.name === "company_name"
          ? {
              ...field,
              type: "select",
              options: companies
                .map((company) => company.company_name)
                .filter(Boolean),
            }
          : field,
      ),
    }),
    [companies],
  );

  return (
    <Layout role="admin" title={mode === "edit" ? "Edit User" : "Add User"}>
      <EntityFormPage mode={mode} {...config} />
    </Layout>
  );
}
