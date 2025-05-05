interface ProjectFormProps {
    mode: "create" | "edit";
}
const ProjectForm: React.FC<ProjectFormProps> = ({ mode }) => {
    return (
        <div>
            Form {mode}
        </div>
    )
}

export default ProjectForm