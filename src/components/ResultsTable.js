'use client';

export default function ResultsTable({ links }) {
    if (!links || links.length === 0) return null;

    const getStatusColor = (status) => {
        if (!status) return 'text-gray-400';
        if (status >= 200 && status < 300) return 'text-success';
        return 'text-error';
    };

    const getStatusIcon = (status) => {
        if (!status) return '⏳';
        if (status >= 200 && status < 300) return '✅';
        return '❌';
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <div className="glass-card overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Found {links.length} Links</h3>
                    <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-success"></span> Valid
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-error"></span> Broken
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">URL</th>
                                <th className="p-4 font-medium">Page</th>
                                <th className="p-4 font-medium text-right">Code</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {links.map((link, index) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-2xl">
                                        {getStatusIcon(link.status)}
                                    </td>
                                    <td className="p-4 font-mono text-sm break-all">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary transition-colors"
                                        >
                                            {link.url}
                                        </a>
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        {link.page}
                                    </td>
                                    <td className={`p-4 text-right font-bold ${getStatusColor(link.status)}`}>
                                        {link.status || '...'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
