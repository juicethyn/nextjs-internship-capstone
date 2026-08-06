import { Filter, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function ProjectsSearchFilter() {
	return (
		<div className="flex flex-col sm:flex-row gap-4">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

				<Input placeholder="Search projects..." className="pl-9" />
			</div>
			<Button variant="outline" className="flex items-center gap-2">
				<Filter size={16} />
				Filter
			</Button>
		</div>
	);
}
