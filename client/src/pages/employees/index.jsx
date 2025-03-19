import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, User, UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data - would be fetched from API in real app
const mockEmployees = [
  {
    id: "E001",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Manager",
    status: "active",
    dateAdded: "2023-01-15",
  },
  {
    id: "E002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Sales Associate",
    status: "active",
    dateAdded: "2023-02-10",
  },
  {
    id: "E003",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "Sales Associate",
    status: "inactive",
    dateAdded: "2023-02-20",
  },
];

export default function EmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState(mockEmployees);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "Sales Associate",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value,
    });
  };

  const handleRoleChange = (value) => {
    setNewEmployee({
      ...newEmployee,
      role: value,
    });
  };

  const handleAddEmployee = () => {
    // Validate email
    if (!newEmployee.email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would send this to your API
    const newEmployeeWithId = {
      ...newEmployee,
      id: `E${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      status: "pending",
      dateAdded: new Date().toISOString().split("T")[0],
    };

    setEmployees([...employees, newEmployeeWithId]);

    toast({
      title: "Employee added",
      description: `Invitation sent to ${newEmployee.email}`,
    });

    // Reset form
    setNewEmployee({
      name: "",
      email: "",
      role: "Sales Associate",
    });

    setIsAddDialogOpen(false);
  };

  const handleToggleStatus = (id) => {
    const updatedEmployees = employees.map((emp) => {
      if (emp.id === id) {
        const newStatus = emp.status === "active" ? "inactive" : "active";
        return { ...emp, status: newStatus };
      }
      return emp;
    });

    setEmployees(updatedEmployees);

    const employee = employees.find((emp) => emp.id === id);
    const newStatus = employee.status === "active" ? "inactive" : "active";

    toast({
      title: `Employee ${newStatus === "active" ? "activated" : "deactivated"}`,
      description: `${employee.name} is now ${newStatus}`,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">Manage your store employees</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>
                Manage employee access and roles
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Enter employee details to send an invitation
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Employee name"
                        className="pl-8"
                        value={newEmployee.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="employee@example.com"
                        className="pl-8"
                        value={newEmployee.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newEmployee.role}
                      onValueChange={handleRoleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Sales Associate">
                          Sales Associate
                        </SelectItem>
                        <SelectItem value="Inventory Clerk">
                          Inventory Clerk
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmployee}>Send Invitation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.status === "active"
                              ? "success"
                              : employee.status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.dateAdded}</TableCell>
                      <TableCell>
                        {employee.status !== "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(employee.id)}
                          >
                            {employee.status === "active" ? (
                              <UserMinus className="h-4 w-4 text-destructive" />
                            ) : (
                              <UserPlus className="h-4 w-4 text-success" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
