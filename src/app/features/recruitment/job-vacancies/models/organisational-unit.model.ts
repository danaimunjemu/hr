export interface OrganisationalUnit {
    id: string;
    name: string;
    code: string;
    parentUnitId?: string;
    type?: string;
}
