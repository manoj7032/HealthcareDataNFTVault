import React from "react";
import { FileText, Hospital, Clock, ChartPie, Activity, Users } from "lucide-react";

export const StatsCard = ({ icon: Icon, title, value, color = "indigo" }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <Icon className={`h-6 w-6 text-${color}-600`} />
    </div>
    <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

export const DataListCard = ({ title, data, icon: Icon }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center gap-3 mb-6">
      <Icon className="h-6 w-6 text-indigo-600" />
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-700 font-medium">{key}</span>
          <span className="text-indigo-600 font-semibold">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const RecordsOverview = ({ recordsStats, mintedData }) => {
  const formatRecentRecords = (records) =>
    records.slice(-5).reverse().map((item) => ({
      tokenId: item.tokenId,
      type: item.metadata[0],
      date: new Date(item.metadata[1]).toLocaleDateString() || "N/A",
    }));

  const validMonthData = Object.entries(recordsStats.byMonth).filter(
    ([month, count]) => month !== "Invalid Date NaN"
  );

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={FileText}
          title="Total Records"
          value={recordsStats.total}
          color="indigo"
        />
        <StatsCard
          icon={Hospital}
          title="Healthcare Providers"
          value={Object.keys(recordsStats.byProvider).length}
          color="emerald"
        />
        <StatsCard
          icon={Clock}
          title="Time Periods"
          value={Object.keys(recordsStats.byMonth).length}
          color="amber"
        />
        <StatsCard
          icon={ChartPie}
          title="Data Types"
          value={Object.keys(recordsStats.byType).length}
          color="rose"
        />
      </section>

      {/* Cards for Data Types and Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataListCard
          title="Records by Type"
          data={recordsStats.byType}
          icon={Activity}
        />
        <DataListCard
          title="Records by Provider"
          data={recordsStats.byProvider}
          icon={Users}
        />
      </div>

      {/* Records by Month */}
      <section className="card">
        <h2 className="text-xl font-semibold">Records by Month</h2>
        <div className="record-list">
          {validMonthData.map(([month, count]) => (
            <div key={month} className="recent-record-card">
              <span>{month}</span>
              <span>Total: {count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Records */}
      <section className="card">
        <h2 className="text-xl font-semibold">Recent Records</h2>
        <div className="record-list">
          {formatRecentRecords(mintedData).map((record) => (
            <div key={record.tokenId} className="recent-record-card">
              <span>
                <strong>Token ID:</strong> {record.tokenId}
              </span>
              <span className="type">{record.type}</span>
              <span className="date">{record.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RecordsOverview;

  