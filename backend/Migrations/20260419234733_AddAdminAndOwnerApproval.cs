using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstatePro.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminAndOwnerApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OwnerRequestStatus",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OwnerRequestStatus",
                table: "Users");
        }
    }
}
